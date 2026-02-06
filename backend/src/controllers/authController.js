const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sqliteDb = require('./../config/sqlite');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  const userResponse = { ...user };
  delete userResponse.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Validation
  if (!name || !email || !password || !passwordConfirm) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if user already exists
  const existingUser = sqliteDb.findUserByEmail(email);
  if (existingUser) {
    return next(new AppError('Email already in use', 409));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Save to SQLite
  try {
    const result = sqliteDb.saveUser(name, email, hashedPassword, 'user');
    console.log('[Auth] User created:', email);

    // Fetch created user
    const newUser = sqliteDb.findUserByEmail(email);
    createSendToken(newUser, 201, res);
  } catch (error) {
    return next(new AppError('Error creating user: ' + error.message, 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user
  const user = sqliteDb.findUserByEmail(email);
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Update last login
  sqliteDb.updateUserLastLogin(user.id);
  console.log('[Auth] User logged in:', email);

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET || 'your-secret-key'
  );

  // Find user
  const currentUser = sqliteDb.findUserById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User not found', 401));
  }

  req.user = currentUser;
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully' });
};

exports.getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(new AppError('Please provide all password fields', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const user = req.user;
  const passwordMatch = await bcrypt.compare(passwordCurrent, user.password);

  if (!passwordMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Hash new password and update (would need UPDATE function in sqlite)
  res.status(200).json({
    status: 'success',
    message: 'Password updated'
  });
});

exports.forgotPassword = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Not implemented'
  });
};

exports.resetPassword = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Not implemented'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  console.log('Authorization Header:', req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('Extracted Token:', token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('🔍 Forgot Password Request Received');
  console.log('📧 Request Body:', req.body);

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  console.log('👤 User Found:', user ? 'Yes' : 'No');
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetToken // Ye line add ki hai testing ke liye
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

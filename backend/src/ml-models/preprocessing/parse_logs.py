"""
Log Parser for Web Server Access Logs
Parses Apache/NGINX access logs and extracts structured data
"""

import re
import pandas as pd
from datetime import datetime
from tqdm import tqdm
import os

# Apache/NGINX log pattern
LOG_PATTERN = r'(\S+) - - \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"'

def parse_log_line(line):
    """Parse a single log line"""
    match = re.match(LOG_PATTERN, line)
    if match:
        try:
            request_parts = match.group(3).split(' ')
            method = request_parts[0] if len(request_parts) > 0 else 'UNKNOWN'
            endpoint = request_parts[1] if len(request_parts) > 1 else '/'
            protocol = request_parts[2] if len(request_parts) > 2 else 'HTTP/1.1'
            
            return {
                'ip': match.group(1),
                'timestamp': match.group(2),
                'method': method,
                'endpoint': endpoint,
                'protocol': protocol,
                'status': int(match.group(4)),
                'size': int(match.group(5)),
                'referrer': match.group(6),
                'user_agent': match.group(7)
            }
        except Exception as e:
            return None
    return None

def parse_access_log(log_file, output_file, sample_size=None, chunk_size=10000):
    """
    Parse access log file and save to CSV
    
    Args:
        log_file: Path to access.log
        output_file: Path to save parsed CSV
        sample_size: Number of lines to process (None = all)
        chunk_size: Process in chunks to save memory
    """
    print(f"📖 Parsing access log: {log_file}")
    
    logs = []
    line_count = 0
    
    with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
        for line in tqdm(f, desc="Parsing logs"):
            if sample_size and line_count >= sample_size:
                break
                
            parsed = parse_log_line(line.strip())
            if parsed:
                logs.append(parsed)
                line_count += 1
                
                # Save in chunks to avoid memory issues
                if len(logs) >= chunk_size:
                    df_chunk = pd.DataFrame(logs)
                    
                    # Append to CSV
                    if not os.path.exists(output_file):
                        df_chunk.to_csv(output_file, index=False)
                    else:
                        df_chunk.to_csv(output_file, mode='a', header=False, index=False)
                    
                    logs = []
                    print(f"✅ Processed {line_count} lines...")
    
    # Save remaining logs
    if logs:
        df_chunk = pd.DataFrame(logs)
        if not os.path.exists(output_file):
            df_chunk.to_csv(output_file, index=False)
        else:
            df_chunk.to_csv(output_file, mode='a', header=False, index=False)
    
    print(f"✅ Parsing complete! Total lines: {line_count}")
    print(f"💾 Saved to: {output_file}")
    
    return line_count

def main():
    """Main execution"""
    # Paths (fixed for correct directory structure)
    RAW_DATA_DIR = "../../data set"  # Two levels up from preprocessing/
    PROCESSED_DATA_DIR = "../data/processed"  # One level up, then into data/processed
    
    # Create directories
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    
    # Input/Output files
    log_file = os.path.join(RAW_DATA_DIR, "access.log")
    output_file = os.path.join(PROCESSED_DATA_DIR, "parsed_logs.csv")
    
    # Parse logs (sample 100K lines for development)
    # Set sample_size=None to process entire file
    parse_access_log(
        log_file=log_file,
        output_file=output_file,
        sample_size=100000,  # 100K for development
        chunk_size=10000
    )
    
    # Load and display summary
    print("\n📊 Data Summary:")
    df = pd.read_csv(output_file)
    print(df.info())
    print("\n📈 Sample Data:")
    print(df.head())
    
    print("\n✅ Log parsing complete!")

if __name__ == "__main__":
    main()

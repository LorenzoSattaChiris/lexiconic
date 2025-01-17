# This is a DDOS Test I wrote last Month to test the rate limiter on the app (which is disabled at the moment). It was NOT written (nor tested) during the 48 hours. 

import subprocess
import time
from collections import defaultdict

base_ip = 121  # Set the base IP here

processes = []
response_counts = defaultdict(lambda: defaultdict(int))
response_messages = defaultdict(lambda: defaultdict(str))

for ip in range(1, 11):
    for i in range(1, 50):
        process = subprocess.Popen([
            'curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-H', f'X-Forwarded-For: 192.{base_ip}.0.{ip}',
            'http://localhost:3001/'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append((process, f'192.{base_ip}.0.{ip}'))

# Wait for all subprocesses to complete and count their output
for process, ip in processes:
    stdout, stderr = process.communicate()
    response_code = stdout.decode().strip()
    error_message = stderr.decode().strip()
    response_counts[ip][response_code] += 1
    if response_code == '429':
        response_messages[ip][response_code] = error_message
    else:
        response_messages[ip][response_code] = 'Success'

# Print the summary table
print(f'{"IP Address":<15} {"Response Code":<15} {"Count":<5} {"Response":<15}')
print('-' * 60)
for ip, codes in sorted(response_counts.items()):
    for code, count in sorted(codes.items()):
        if code == '429':
            response = response_messages[ip][code]
            print(f'{ip:<15} {code:<15} {count:<5} {"Rate Limit":<15}')
        else:
            print(f'{ip:<15} {code:<15} {count:<5} {"Success":<15}')
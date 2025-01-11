import sys

# Redirect stdin to read from 'input.txt'
sys.stdin = open('input.txt', 'r')

# Read user code from 'code.py'
with open('code.py', 'r') as code_file:
    user_code = code_file.read()

# Execute the user's code
try:
    exec_globals = {}
    exec(user_code, exec_globals)
except Exception as e:
    print(f"Error during execution: {e}")
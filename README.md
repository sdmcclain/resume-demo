# Overview

# Steps

1. Create a schema for Resumes

Sample 10 resumes, feed to Gemini 2, ask for JSON schema


2. Extract all resumes into that schema


Gemini 2

Include the ResumeId.


3. Tool to run code in the sandbox

e2b sandbox code-interpreter

Input is the code

Output is a string


4. Tool to create a function that will create a CSV from the JSON 

Input is the JSON Schema

Output is python code


Claude 3.7 sonnet


5. Tool to create a function that will analyze the CSV

Input is the CSV schema

Output is the python code, using pandas


6. Answer the question from the outputs

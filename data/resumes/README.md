# Data

## Generate JSON Schema for Resumes

```
llm -m claude-3.7-sonnet 'generate a JSON schema that represents the key pieces of information in resumes, using the attached examples as a reference' -a raw/ENGINEERING/10030015.pdf -a raw/ACCOUNTANT/10554236.pdf -a raw/HR/10399912.pdf > resume.schema.json
```


## Extract PDFs

```
fd --type f -e pdf . raw -x sh -c 'llm -m gemini-2.0-flash --schema ./resume.schema.json extract -a "$1" > "processed/$(basename "$1" .pdf).json"' -- {} \;
```


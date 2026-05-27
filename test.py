import requests
import json

system_prompt = """
You are a advanced coding and coding related doubt assement assistant.
You help solving codechef problem , you will be provided question in <context> block and you have to provide solution for the files fully.
You have to give me full code in the solution.
Dont change the comments given in the code and don't add any extra unnecessary comments in your solution.
"""

messages = [
    {"role":"system" , "content":system_prompt}
]

jsonBinURL = "https://api.jsonbin.io/v3/b/6a137add6610dd3ae89cfd95"

baseURL = "https://integrate.api.nvidia.com/v1/chat/completions"
baseURL = "https://api.cerebras.ai/v1/chat/completions"
baseURL = "https://api.groq.com/openai/v1/chat/completions"
baseURL = "https://openrouter.ai/api/v1/chat/completions"


headers = {
    "Content-Type":"application/json",
    "Authorization":"Bearer __api_key__"
}

# FOR nvidia and cerebras (gpt-oss-120b)
payload = {
    "model": "openai/gpt-oss-120b",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":False,
    "reasoning_effort":"high"
}

# non-reasoning payload for cerebras and groq
payload = {
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":False,
}

# payload for openrouter with reasoning_effort
payload = {
    "model": "minimax/minimax-m2.5:free",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":False,
    "reasoning_effort":"high"
}


"""
payloadNv can be used by Cerebras , Nvidia for gpt-oss-120b , for other models remove reasoning_effort

Nvidia:
baseURL : https://integrate.api.nvidia.com/v1/chat/completions
openai/gpt-oss-120b
minimaxai/minimax-m2.7

Cerebras:
baseURL : https://api.cerebras.ai/v1/chat/completions
gpt-oss-120b - 65K max context 
zai-glm-4.7 - 65K max context

Groq:
baseURL = "https://api.groq.com/openai/v1/chat/completions"
meta-llama/llama-4-scout-17b-16e-instruct : 30K per min

OpenRouter:
baseURL = https://openrouter.ai/api/v1/chat/completions
deepseek/deepseek-v4-flash:free
minimax/minimax-m2.5:free
google/gemma-4-31b-it:free
openai/gpt-oss-120b:free
"""

def queryModel(baseURL, headers, payload):
    try:
        response = requests.post(baseURL, headers=headers, json=payload)
        response_dict = response.json()
        
        # return response_dict.choices[0].message.content
        return response_dict.choices[0].message.content
    except Exception as error:
        print(f"Error querying the model: {error}")
        return None

def writeToFile(messages):
    data = messages[-1].get("content", "") if messages else ""
    try:
        with open("result.md", "w") as f:
            f.write(data)
        print("Response written to result.md")
    except Exception as err:
        print(f"Error writing to file: {err}")

def chat(userQuery):
    messages.append({"role":"user" , "content":userQuery})
    response = queryModel(baseURL, headers, payload)
    print(f"Model Response: {response}")
    messages.append({"role":"assistant" , "content":response})
    writeToFile(messages)
    return response

def flushMessages():
    messages.clear()
    messages.append({"role":"system" , "content":system_prompt})

def fetchbin():
    try:
        response = requests.get(jsonBinURL)
        response_dict = response.json()
        print(f"Fetched from jsonbin: {response_dict}")
    except Exception as error:
        print(f"Error fetching from jsonbin: {error}")

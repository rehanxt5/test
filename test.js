const fs = require('fs');
const system_prompt = `
You are a advanced coding and coding related doubt assement assistant.
You help solving codechef problem , you will be provided question in <context> block and you have to provide solution for the files fully.
You have to give me full code in the solution.
Dont change the comments given in the code and don't add any extra unnecessary comments in your solution.
`;

let messages = [
    {"role":"system" , "content":system_prompt}

];

let jsonBinURL = "https://api.jsonbin.io/v3/b/6a137add6610dd3ae89cfd95";

let baseURL = "https://integrate.api.nvidia.com/v1/chat/completions";
let baseURL = "https://api.cerebras.ai/v1/chat/completions";
let baseURL = "https://api.groq.com/openai/v1/chat/completions";
let baseURL = "https://openrouter.ai/api/v1/chat/completions";


let headers = {
    "Content-Type":"application/json",
    "Authorization":"Bearer __api_key__"
};
// FOR nvidia and cerebras (gpt-oss-120b)
let payload = {
    "model": "openai/gpt-oss-120b",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":false,
    "reasoning_effort":"high"
};
// non-reasoning payload for cerebras and groq
let payload = {
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":false,
};

// payload for openrouter with reasoning_effort
let payload = {
    "model": "minimax/minimax-m2.5:free",
    "messages":messages,
    "temperature":0.7,
    "max_tokens":4096,
    "stream":false,
    "reasoning_effort":"high"
};


/*
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
*/

async function queryModel(baseURL,headers , payload) {
    try{
        const response = await fetch(baseURL , {
            method:"POST",
            headers:headers,
            body:JSON.stringify(payload)
        });
        const response_dict = await response.json();

        // return response_dict.choices[0].message.content;
        return response_dict.choices[0].message.content;
    }catch(error){
        console.error("Error querying the model:", error);
        return null;
    }
};

async function writeToFile(messages){
    const data = messages[messages.length - 1]?.content ?? "";
    fs.writeFile("result.md" , data , (err) => {
        if(err){
            console.error("Error writing to file:", err);
        }else{
            console.log("Response written to result.md");
        }
    });
};

async function chat(userQuery){
    messages.push({"role":"user" , "content":userQuery});
    const response = await queryModel(baseURL , headers , payload);
    console.log("Model Response:", response);
    messages.push({"role":"assistant" , "content":response});
    await writeToFile(messages);
    return response;
};

function flushMessages(){
    messages.length = 0;
    messages.push({"role":"system" , "content":system_prompt});
};

async function fetchbin(){
    try{
        const response = await fetch(jsonBinURL);
        const response_dict = await response.json();
        console.log("Fetched from jsonbin:", response_dict);
    }catch(error){
        console.error("Error fetching from jsonbin:", error);
    }
}

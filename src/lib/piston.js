// for code execution

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_VERSIONS = {
    javascript: { language: "javascript", version: "18.15.0" },
    python: { language: "python", version: "3.10.0" },
    java: { language: "java", version: "15.0.2" },
}
/**
*@param {string} language - programming language
*@param {string} code - source code to be executed
*@returns {Promise<{success:Boolean, output?:string, error?:string}>} - execution result
**/
export async function executeCode(language,code){
    try {
        const langConfig = LANGUAGE_VERSIONS[language.toLowerCase()];
        if(!langConfig){
            return {success:false, error:"Unsupported language"};
        }

        const response=await fetch(`${PISTON_API}/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files:[
                    {
                        name: `main.${getFileExt(language)}`,
                        content: code
                    },
                ],
            })
        });

        if(!response.ok){
            return {success:false, error:`Piston API error: ${response.statusText}`};
        }

        const data = await response.json();

        const output = data.run.output || "";

        const stderr = data.run.stderr || "";

        if(stderr){
            return{
                success: false,
                output: output,
                error: stderr
            }
        }

        return {
            success: true,
            output: output|| "No output"
        }

    } catch (error) {
        return {success:false, error: `Failed to execute code: ${error.message}` };
    }
}

function getFileExt(language){
    const extensions = {
        javascript: "js",
        python: "py",
        java: "java"
    };
    return extensions[language.toLowerCase()] || "txt";
}
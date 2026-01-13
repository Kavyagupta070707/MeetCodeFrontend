import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems.js";
const CodeEditor = ({language, onLanguageChange, code, isrunning, onRunCode, onCodeChange}) => {
  return (
    <div className="h-full bg-base-300 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
            <select
              className="select select-sm"
              value={language}
              onChange={onLanguageChange}
            >
                {Object.entries(LANGUAGE_CONFIG).map(([Key,lang]) => (
                  <option key={Key} value={Key}>
                    {lang.name}
                  </option>
                ))}
            </select>

            <button className="btn btn-sm btn-primary gap-2" onClick={onRunCode} disabled={isrunning}>
              {isrunning ? (<><Loader2Icon className="animate-spin h-4 w-4"/>Running...</>) : (<><PlayIcon className="h-4 w-4"/> Run Code</>)}
            </button>
        </div>
        <div className="flex-1 py-3">
            <Editor
              height="100%"
              language={LANGUAGE_CONFIG[language].monacoLang}
              value={code}
              onChange={onCodeChange}
              theme="vs-dark"
              options={{
                fontSize:16,
                lineNumbers:"on",
                scrollBeyondLastLine:false,
                automaticLayout:true,
                minimap:{enabled:false}
              }
              }
              />
        </div>
    </div>
  )
}

export default CodeEditor
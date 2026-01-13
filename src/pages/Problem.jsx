import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems.js";
import Navbar from "../components/Navbar.jsx";
import { useEffect } from "react";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import { executeCode } from "../lib/piston.js";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti"
const Problem = () => {
    const { id}= useParams();
    const navigate = useNavigate()
    const [problemId, setproblemId]= useState("two-sum");
    const [language, setlanguage]= useState("python");
    const [code, setcode]= useState(PROBLEMS[problemId].starterCode.python);
    const [output, setoutput]= useState(null);
    const [isrunning, setisrunning]= useState(false);

    useEffect(()=>{
        if(id && PROBLEMS[id]){
          setproblemId(id);
          setcode(PROBLEMS[id].starterCode[language] );
          setoutput(null)
        }
    },[id, language]);

    const curProblem = PROBLEMS[problemId];

    const handlelanguageChange = (e) => { setlanguage(e.target.value)}

    const hndleproblemChange= (e)=> navigate(`/problem/${e}`);

    const triggerConfetti=()=>{
      confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
    }

    const normalizeOutput=(output)=>{
      return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
    }

    const checkIftestsPassed=(actualOutput, expectedOutput)=>{

     const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;

    }

    const handleRunCode= async ()=>{
      setisrunning(true)
      setoutput(null)

      const result = await executeCode(language, code);
      setoutput(result)
      setisrunning(false)

      if(result.success){
        const expectedOutput = curProblem.expectedOutput[language]
        const testpassed=checkIftestsPassed(result.output, expectedOutput)

        if(testpassed){
          triggerConfetti();
          toast.success("All tests case passed successfully")
        }
        else{
          toast.error("Some test cases failed. Please check the output.")
        }
      }
      else{
        toast.error("Error while executing the code.")
      }
    }
  return (
    <div className="h-full bg-base-100 flex flex-col overflow-hidden">
      <Navbar/>
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
             problem ={curProblem}
             currentProblemId ={problemId}
             onProblemChange={hndleproblemChange}
             language={language}
             allProblems = {Object.values(PROBLEMS)} 
            />
          </Panel>
          <PanelResizeHandle className="w-2 bg-base-400 hover:bg-base-100 transition-colors cursor-col-resize"/>
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <CodeEditor
                  language={language}
                  onLanguageChange={handlelanguageChange}
                  code={code}
                  isrunning={isrunning}
                  onRunCode={handleRunCode}
                  onCodeChange={setcode}
                />
              </Panel>
                <PanelResizeHandle className="h-2 bg-base-400 hover:bg-base-100 transition-colors cursor-row-resize"/>
              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output}/>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

export default Problem
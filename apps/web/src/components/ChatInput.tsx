/*
 + Input box for user prompts -> done
 + display of model
 + display of token usage of current chat
 + options for web, rag and tools -> done
 + drag and drop for file upload 
*/

import { useEffect, useRef, useState, type SetStateAction } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { type IChat, type IMessage } from "@/interfaces";
import { streamResponse } from "@/streamResponse";


function ChatInput({setMessages}:{setMessages:React.Dispatch<React.SetStateAction<IMessage[]>>}) {


    const {
        setValue,
        getValues,
        watch
    } = useFormContext<IChat>()
    
    
    const models:string[] = ['Claude-Sonnet', 'Claude-Opus']
    const [files, setFiles] = useState<File[]>([])
    const [webSearch, setWebSearch] = useState<boolean>(false)
    const [ragUsage, setRagUsage] = useState<boolean>(false)
    const [toolUsage, setToolUsage] = useState<boolean>(false)
    const [model, setModel] = useState<number>(0)

    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleKeyDown = async  (e:React.KeyboardEvent<HTMLTextAreaElement>) => {


        if(e.currentTarget !== null &&  e.key === "Enter" && e.ctrlKey) {
            e.preventDefault()
            const textarea = e.currentTarget 
            const userInputValue = e.currentTarget.value;
            if(!userInputValue) return;


            const newMessage:IMessage = {
                timestamp: Date.now(),
                role:'user',
                content: userInputValue,
                files:files
            }

            const placeholderResponse:IMessage = {
                timestamp: Date.now() + 1,
                role:'assistant',
                content:'',
                files:[]
            }

            const currentMessages = watch('messages') || []
            const updatedMessages = [placeholderResponse, newMessage, ...currentMessages]
            setMessages(updatedMessages)

            setValue('timestamp', Date.now())
            setValue('date', new Date().toISOString())
            setValue('messages', updatedMessages)
            setValue('model', models[model]!);
            setValue('web', webSearch);
            setValue('rag', ragUsage);
            setValue('tool', toolUsage);
         
            await streamResponse(getValues(), setValue, setMessages)
            textarea.value = ''
        }
    }   

    const handleFileUpload = (e:React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {

        const newFile:File|null|undefined = e.currentTarget.files?.item(0)
        if (newFile) {
            setFiles([...files, newFile])
        }
    }

 
    return(
        <div className="h-full flex-1 rounded-xl flex flex-row justify-between gap-4">
            
            {/* overview over several parameters (token count, model, etc..) */}
            <div className="flex-1 flex flex-col justify-around gap-2 rounded-xl p-2 text-xs">
                <button 
                    className={`w-full flex-1 border rounded-xl p-2 hover:text-green-500`}
                    onClick={() => setModel((model + 1)%models.length)}
                >
                    {models[model]}
                </button>
                <div className="flex-4 p-2 border rounded-xl">
                    <div className="p-2">{`Input: ${getValues('inputTokens')} `}</div>
                    <div className="p-2">{`Output: ${getValues('outputTokens')} `}</div>
                    <div className="p-2">{`Total costs: $${getValues('totalCosts').toFixed(4)} `}</div>
                </div>
            </div>

            {/* Element for file upload*/}
            <div className="bg-gray-700 flex-4 rounded-xl flex flex-col">
                <textarea
                    className="w-full flex-1 resize-none bg-gray-700 rounded-xl p-4 focus:outline focus:outline-offset-2 focus:outline-white"
                    onKeyDown={e => handleKeyDown(e)}
                    autoComplete="off"
                    autoFocus={true}
                    wrap="soft"
                    placeholder="..."
                />
                <div>
                    {
                        files.length > 0 && files.map(
                            (file:File, index:number) => {return(
                                <button
                                    key={index}
                                    className="border rounded-xl text-xs p-2 hover:outline hover:outline-red-500 hover:text-red-500 m-1"
                                    onClick={() => setFiles(files.filter((file:File, idx:number) => idx !== index))}
                                >
                                    {`${file.name.slice(0,20)} - ${Math.round(file.size/1024**2)} MB`}
                                </button>
                            )}
                        )
                    } 
                </div>            
            </div>

            {/* Element for file upload, allow internet search, allow rag, allow tools */}

            <div className="flex-1 flex flex-col justify-around gap-2 rounded-xl p-2 text-xs">

                <button 
                    className="w-full flex-1 border rounded-xl p-2"
                    onClick={() => fileInputRef.current?.click()}
                >
                    📎 Datei hochladen
                </button>
                <button 
                    className={`w-full flex-1 border rounded-xl p-2 ${webSearch? 'text-green-500': 'text-red-500'}`}
                    onClick={() => setWebSearch(!webSearch)}
                >
                    {webSearch ? "Web erlaubt" : "Web blockiert"}
                </button>
                <button 
                    className={`w-full flex-1 border rounded-xl p-2 ${ragUsage? 'text-green-500': 'text-red-500'}`}
                    onClick={() => setRagUsage(!ragUsage)}
                >
                    {ragUsage? "RAG erlaubt" : "RAG blockiert"}
                </button>
                <button 
                    className={`w-full flex-1 border rounded-xl p-2 ${toolUsage? 'text-green-500': 'text-red-500'}`}
                    onClick={() => setToolUsage(!toolUsage)}
                >
                    {toolUsage ? "Tools erlaubt" : "Tools blockiert"}
                </button>
            </div>
            { /* hidden elements for functionality */}
            <input className="hidden" ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e)}/>
        </div>
    )
}

export default ChatInput;
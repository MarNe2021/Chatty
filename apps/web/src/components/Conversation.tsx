import { type IChat, type IMessage } from "@/interfaces"
import { useFormContext } from "react-hook-form"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import React from "react"



const ChatMessage = React.memo(({value, index, contHorizont}:{value:IMessage, index:number, contHorizont:number}) => {
    return (
            <div
                className={`prose prose-sm w-6/7 border rounded-xl p-2 max-w-[85%] wrap-break-word ${
                    value.role === 'user'
                        ? 'bg-gray-200 outline-3 outline-blue-400 text-black self-start'
                        : 'bg-gray-200 outline-3 outline-green-400 text-black self-end'
                } ${index > contHorizont + 1 ? 'italic' : ''}   `}
            >   
                {<ReactMarkdown 
                    remarkPlugins={[remarkGfm]}                
                >{value.content}</ReactMarkdown>}
            </div>
        );

    });




function Conversation({messages}:{messages:IMessage[]}) {


    const {
        getValues
    } = useFormContext<IChat>()


    return(
        <div className="bg-gray-700 flex-4 h-full overflow-y-auto gap-6 pl-40 pr-40 pb-10 pt-10 text-xs flex flex-col-reverse">
            {
                messages && messages.map((value: IMessage, index: number) => (
                    <ChatMessage 
                        key={value.timestamp || index} 
                        value={value} 
                        index={index} 
                        contHorizont={getValues('contextHorizont')}
                    />
                ))
            }
        </div>
    )
}

export default Conversation
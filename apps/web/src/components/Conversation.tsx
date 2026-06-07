import { type IChat, type IMessage } from "@/interfaces"
import { useFormContext } from "react-hook-form"
import Markdown from "react-markdown"
import React from "react"



const ChatMessage = React.memo(({value, index}:{value:IMessage, index:number}) => {
    return (
            <div
                className={`w-6/7 border rounded-xl p-2 max-w-[85%] whitespace-pre-wrap wrap-break-word ${
                    value.role === 'user'
                        ? 'bg-blue-700 text-white self-start'
                        : 'bg-gray-200 text-black self-end'
                }`}
            >   

                {<Markdown>{value.content}</Markdown>}
            </div>
        );

    });




function Conversation({messages}:{messages:IMessage[]}) {

    return(
        <div className="bg-blue-900 flex-4 h-full overflow-y-auto gap-6 pl-40 pr-40 pb-10 pt-10 text-xs flex flex-col-reverse">
            {
                messages && messages.map((value: IMessage, index: number) => (
                    <ChatMessage 
                        key={value.timestamp || index} 
                        value={value} 
                        index={index} 
                    />
                ))
            }
        </div>
    )
}

export default Conversation
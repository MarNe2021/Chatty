import { useEffect, useState } from "react"
import ChatInput from "./ChatInput"
import Conversation from "./Conversation"
import { type IMessage } from "@/interfaces"


function ConversationPanel() {


    const [messages, setMessages] = useState<IMessage[]>([])
    console.log("ConversationPanel render, messages length:", messages.length, messages[0]?.content)
    return (
        <div className="h-full max-h-full min-h-0 flex-4 rounded-xl flex flex-col justify-between gap-4 text-white">
            <Conversation messages={messages}/>
            <ChatInput setMessages={setMessages}/>
        </div>
    )
}


export default ConversationPanel
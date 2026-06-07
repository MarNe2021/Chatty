import type { UseFormSetValue } from "react-hook-form";
import type { IChat, IMessage } from "./interfaces";
import { flushSync } from 'react-dom';


export async function streamResponse(chat:IChat,
                 setValue:UseFormSetValue<IChat>,
                setMessages:React.Dispatch<React.SetStateAction<IMessage[]>>) {
    try{
        const response = await fetch('http://127.0.0.1:8000/api/converse', {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chat)
        });

        const reader= response.body?.getReader();
        const decoder:TextDecoder = new TextDecoder();

        let currentResponseText = "";
        let remainingBuffer = "";
        
        while(reader) {
            const {value, done} = await reader.read();
            if (done) break;

            const chunk = remainingBuffer + decoder.decode(value, {stream:true});
            
            const lines = chunk.split("\n")

            remainingBuffer = lines.pop() || ""; // for incomplete lines

            let textChanged = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
                
                if(line?.startsWith("event: text")) {
                    const nextLine = lines[i + 1] || remainingBuffer;
                    if (nextLine && nextLine.startsWith("data: ")) {
                        const textData = nextLine.slice(6);  // removes "data: "
                        currentResponseText += textData;
                        textChanged = true;
                        i++ // skip empty line after "data: ...."
                    }

                    await delay(100)

                } else if (line?.startsWith("event: metrics")) {
                    const nextLine = lines[i + 1] || remainingBuffer;
                    if (nextLine && nextLine.startsWith("data: ")) {
                        const metricsData = nextLine.slice(6);
                        try {
                            const metrics = JSON.parse(metricsData);
                            setValue("inputTokens", metrics.inputTokens);
                            setValue("outputTokens", metrics.outputTokens);
                        } catch (e) {
                            console.error("Fehler beim Parsen der Metriken", e);
                        }
                        i++; // Überspringe die data-Zeile
                    }
                }
                
                if (textChanged) {
                    flushSync(() => {
                        setMessages(prev => prev.map((msg, i) => 
                            i === 0 ? {...msg, content: currentResponseText} : msg))  
                    })
                }
            }
        } 

        setValue('messages', chat.messages.map((msg, idx) => 
            idx === 0 ? { ...msg, content: currentResponseText } : msg
        ));

    }catch(error) {
            console.error('Streaming error: ', error)   
    } 
}
import "./index.css";
import ConversationPanel from "./components/ConversationPanel";
import { FormularProvider } from "./ConForm";
import { useState } from "react";
import { type IChat, initialChat } from "./interfaces";




export function App() {

  const [chat, setChat] = useState<Partial<IChat>>(initialChat)


  const newChat = () => {
    setChat(initialChat)
  }

  return (
    <FormularProvider defaultValues={chat}>
      <div className="w-screen h-screen bg-black overflow-hidden flex flex-row justify-around gap-4 p-4">
        <div className="bg-gray-800 flex-1 rounded-xl text-white">
          <button className="border rounded-xl p-2"
            onClick={() => {newChat()}}
            > 
              new chat
            </button>
        </div>
        <ConversationPanel/>
      </div>
    </FormularProvider>
  );
}

export default App;

"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message";
import { Send } from "react-feather";
import LoadingDots from "@/components/LoadingDots";
import TypingEffect from '@/components/TypingEffect';
import React from "react";
import './page.css';


function linkify(text: string): string {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url: string) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue;">${url}</a>`;
  });
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

  // Function to render chat messages, handling special content like links and artist images

function renderParagraphs(message: Message) {
  const { content } = message;  // Destructure the necessary properties
  if (!content) {
    // Handle the case where content is undefined or null
    return null; // Or return a default value or component
  }
  return content.split(/\r\n|\n|\r/).map((paragraph, index) => {
    let processedParagraph = linkify(paragraph);
 
    processedParagraph = processedParagraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return (
      <div key={`paragraph-${index}`} className="paragraph" style={{ marginBottom: '1em', overflow: 'auto' }}>
        <div dangerouslySetInnerHTML={{ __html: processedParagraph }} />
      </div>
    );
  });
}


// Main functional component for the application

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! How can i help you today?",
    },
  ]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [userQuery, setUserQuery] = useState<string>("");
  const handleOptionClick = (option: string) => {
    setMessage(option);
    handleClick();
};
const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
const [userIP, setUserIP] = useState('');




const handleClick = async () => {
  if (message.trim() === "") return;
  setHistory((prevHistory) => [
    ...prevHistory,
    { role: "user", content: message },
  ]);
  setMessage("");  

  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/ai_response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ human_input: message,history: history }),
    });

    const data = await response.json();
    const botResponse = data;
    console.log(data)
    setHistory((prevHistory) => [
      ...prevHistory,
      { role: "assistant", content: botResponse },
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  setLoading(false);
};



const handleCancel = () => {
  if (currentRequestId) {
    // Send a cancel request to your backend
     fetch("http://127.0.0.1:5000/cancel_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: currentRequestId,
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Cancel request successful', data);
    })
    .catch((error) => {
      console.error('Error during cancel request:', error);
    });
  }

  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }

  // Clear the current request ID as it's no longer valid
  setCurrentRequestId(null);
  setLoading(false);
};
  const optionButtonStyle = {
    backgroundColor: '#e0e0e0',   // Grey background color
    borderRadius: '12px',         // Rounded corners
    padding: '10px 20px',         // Padding
    margin: '5px',                // Margin
    border: 'none',               // Remove border
    cursor: 'pointer',            // Pointer cursor on hover
};
  //scroll to bottom of chat
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [history]);
  

  return (
    <>
    <main className="h-screen bg-blue p-6 flex flex-col">
    <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
    <h1 className="text-4xl text-transparent font-bold bg-clip-text bg-gradient-to-r from-violet-800 to-fuchsia-500">
          Audience Intelligence Bot
        </h1>
        <div className="flex flex-col gap-8 flex-grow w-full">


          <form   className="rounded-2xl border-purple-700 border-opacity-5  border  flex-grow flex flex-col bg-[url('/images/bg.png')] bg-cover max-h-full overflow-clip"
 onSubmit={(e) => {
            e.preventDefault();
            handleClick();
           }}>
            <div className="overflow-y-scroll:hidden flex flex-col gap-5 p-10 h-full ">
              {history.map((message: Message, idx) => {
                const isLastMessage = idx === history.length - 1;
                switch (message.role) {
                  case "assistant":
                    return (
                      <div ref={isLastMessage ? lastMessageRef : null} key={idx} className="flex gap-2">
                        <img src="images/assistant-avatar.png" className="h-12 w-12 rounded-full" />
                        <div className="w-auto message-box-wide break-words bg-f1f2f2 rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)] ">
                          <div className="message-content">
      {renderParagraphs(message)}
</div>

                          <div>
                          {/* {message.fetchTime && ( 
            <div className="fetch-time text-sm text-gray-500">
              Fetch time: {message.fetchTime.toFixed(2)} s
            </div>
          )} */}
                          </div>
                        </div>
                      </div>
                      
                    );
                  case "user":
                    return (
                      <div className="flex gap-2 self-end">
                        <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-6 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]" key={idx} ref={isLastMessage ? lastMessageRef : null}>

                        {message.content}
                        </div>
                      <img src="images/user-avatar.png" className="h-12 w-12 rounded-full" />

                      
                      </div>
                    );
                }
              })}
              {loading && (
                <div ref={lastMessageRef} className="flex gap-2">
                  <img src="images/assistant-avatar.png" className="h-12 w-12 rounded-full" />
                  <div className="w-auto max-w-xl break-words bg-f1f2f2 rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">

                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
            {loading && (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <button 
      onClick={handleCancel} 
      style={{
        backgroundColor: '#e0e0e0', // Light grey background
        color: '#333', // Dark text for contrast
        border: 'none', // No border
        padding: '10px 20px', // Padding
        borderRadius: '5px', // Rounded corners
        cursor: 'pointer', // Pointer cursor on hover
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' // Shadow for depth
      }}
    >
      Stop Generate
    </button>
  </div>
)}
 {/* input area */}
 {!loading && (
    <div className="input-area">
    <div className="w-3/4 mx-auto relative flex">
      <textarea
        aria-label="chat input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me here"
        className="flex-grow w-3/4 h-11 resize-none rounded-full border border-slate-900/10 bg-white pl-6 pr-12 py-2 text-base placeholder:text-slate-400 focus:border-3982ca-500 focus:outline-none focus:ring-4 focus:ring-3982ca-500/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)] overflow-hidden mb-2"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleClick();
          }
          
        }}
      />

     <button
       onClick={(e) => {
         e.preventDefault();
         handleClick();
       }}
       className="flex w-10 h-10 items-center justify-center rounded-full px-2.5 text-sm  bg-violet-800 font-semibold text-white hover:bg-violet-700 active:bg-violet-800 absolute right-1 bottom-2.5 disabled:bg-violet-100 disabled:text-violet-400"
       type="submit"
       aria-label="Send"
       disabled={!message || loading}
     >
       <Send />
     </button>
   </div>
 </div>
 

)}
          </form>
          
          </div>
      </div>
    </main>
    {/* Add styles for the Stop Generating button */}
    <style jsx>{`
        .fetch-time {
          font-size: 0.75rem;
          color: #656565;
          margin-top: 0px;
          text-align: right;
        }
        .stop-generating-button {
          background-color: #f44336; /* Example style */
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          display: block;
          width: max-content;
          margin: 10px auto;
        }
      `}</style>
    </>
  );
}

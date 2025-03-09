'use client';

import React, { useEffect, useRef, useState } from 'react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from './ui/scroll-area';
import { models } from './model';
import { Send } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const InputContainer = () => {

    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [select, setselect] = useState('gemini 1.5 flash');
    const [modal, setmodal] = useState(false);
    const [isloading, setisloading] = useState(false);
    const [modelname, setmodelname] = useState('gemini-1.5-flash');
    const [text2, setText2] = useState('');


    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [summaries, setSummaries] = useState<string[]>([]);


    const handleGemini = async () => {
        try {
            setisloading(true);

            setChatHistory(prev => [...prev, { role: "user", content: text }]);

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: text,
                    summaries,
                }),
            });

            const data = await res.json();


            if (data.answer) {
                setChatHistory(prev => [...prev, { role: "assistant", content: data.answer }]);

            }

            if (data.summary) {
                setSummaries(prev => {
                    const updatedSummaries = [...prev.slice(-4), data.summary];
                    return updatedSummaries;
                });
            }

        } catch (e) {
            console.error("Error in handleGemini:", e);
        } finally {
            setisloading(false);
        }
    };


    const handleGenerate = async () => {
        try {
            setisloading(true);

            setChatHistory((prev) => [...prev, { role: "user", content: text }]);

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: text,
                    model: modelname,
                    summaries,
                }),
            });

            const data = await res.json();

            if (data.responseText) {
                setChatHistory((prev) => [
                    ...prev,
                    { role: "assistant", content: data.responseText },
                ]);
            }

            if (data.summaryText) {
                setSummaries((prev) => [...prev.slice(-4), data.summaryText]);
            }
        } catch (e) {
            console.error("Error in handleGenerate:", e);
        } finally {
            setisloading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setText2(e.target.value);
    };


    return (
        <div className='h-fit lg:w-[60%] w-[95%] lg:mt-[0] mt-[20vh] rounded-3xl flex flex-col gap-[10px] py-[15px] '>

            <div className="space-y-4 p-4">
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        className={`flex w-full ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`text-[16px] leading-6 font-sans
                                                ${chat.role === "user"
                                    ? "bg-[#f3f3f3] max-w-[70%] px-[20px] py-[10px] text-black rounded-3xl"
                                    : "max-w-[100%] text-black"
                                }`}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: (props) => <h1 className="text-2xl font-bold my-2" {...props} />,
                                    h2: (props) => <h2 className="text-xl font-bold my-2" {...props} />,
                                    h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
                                    p: (props) => <p className={`${chat.role === "user" ? "" : "mb-2"}`} {...props} />,
                                    strong: (props) => <strong className="font-bold" {...props} />,
                                    em: (props) => <em className="italic" {...props} />,
                                    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        if (!inline && match) {
                                            return (
                                                <SyntaxHighlighter
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        borderRadius: '0.5rem',
                                                        padding: '1rem',
                                                        margin: '1rem 0',
                                                    }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            );
                                        }
                                        return (
                                            <code className="bg-gray-200 text-black px-1 rounded" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    ul: (props) => <ul className="list-disc pl-6 mb-2" {...props} />,
                                    ol: (props) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                                    blockquote: (props) => (
                                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props} />
                                    ),
                                    table: (props) => <table className="border-collapse border border-gray-300 w-full my-2" {...props} />,
                                    thead: (props) => <thead className="bg-gray-200" {...props} />,
                                    tbody: (props) => <tbody {...props} />,
                                    tr: (props) => <tr className="border border-gray-300" {...props} />,
                                    th: (props) => <th className="border border-gray-300 px-4 py-2 text-left" {...props} />,
                                    td: (props) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                                }}
                            >
                                {chat.content}
                            </ReactMarkdown>



                        </div>
                    </div>
                ))}
            </div>

            <div className='w-[100%] flex justify-start items-center ' >
                <Popover open={modal} onOpenChange={setmodal}>
                    <PopoverTrigger asChild>
                        <Button className='rounded-2xl w-[160px]  font-mono' onClick={() => setmodal(true)} variant="outline">{select}</Button>
                    </PopoverTrigger>
                    <PopoverContent className={`w-[220px] flex justify-center items-center bg-gray-50 rounded-2xl`} side="top">
                        <ScrollArea className='h-[200px] w-full px-[10px] flex flex-col'>
                            {
                                models.map((model, index) => (
                                    <div key={index} className='w-full cursor-pointer text-[15px] font-mono my-[5px] p-[5px] flex 
                                    justify-center hover:bg-gray-50  transition-all duration-500 items-center bg-gray-100 rounded-2xl'
                                        onClick={() => {
                                            setselect(model.name);
                                            setmodal(false);
                                            setmodelname(model.model);
                                        }}
                                    >
                                        {model.name}
                                    </div>
                                ))
                            }
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>


            <div className='flex flex-col overflow-hidden border-gray-200 border-[1px] rounded-3xl'>
                <Textarea
                    className="resize-none max-h-[200px] font-mono shadow-none overflow-auto border-none rounded-3xl w-full"
                    ref={textareaRef}
                    placeholder="Ask anything"
                    value={text2}
                    onChange={handleChange}
                />
                <div className='flex justify-end mx-[20px] items-center'>
                    {
                        isloading ?
                            <span className='loader'></span>
                            :
                            <Send
                                onClick={async () => {
                                    setText2('');
                                    if (text.trim() === '') return;
                                    if (select === "gemini 1.5 flash") {
                                        await handleGemini();
                                    } else {
                                        await handleGenerate();
                                    }
                                    setText('');
                                }}
                                className={`text-gray-400 size-[30px] ${text == '' && "disabled:cursor-pointer"} mb-[20px] cursor-pointer`}
                            ></Send>
                    }
                </div>
            </div>


        </div >
    );
}

export default InputContainer
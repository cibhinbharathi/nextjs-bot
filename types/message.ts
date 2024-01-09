
export type Message = {
    role: "user" | "assistant";
    content: string;
    links?: { link: string; title: string }[];
    options?: string[];
    fetchTime?: number;
   
};


    

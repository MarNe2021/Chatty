import React, { createContext, useContext } from "react";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import { type IChat } from "./interfaces";



const FormularContext = createContext<UseFormReturn<IChat> | null>(null);


export const useFormular = () => {
    const context = useContext(FormularContext);
    if(!context) throw new Error ("useFormular must be within <FormularProvidedr>");
    return context
}


interface Props{
    children:React.ReactNode;
    defaultValues:Partial<IChat>;
} 

export const FormularProvider = ({children, defaultValues}:Props) => {
    const methods = useForm<IChat>({defaultValues, mode:'onChange'})
    return(
        <FormularContext.Provider value={methods}>
            <FormProvider {...methods}>
                {children}
            </FormProvider>
        </FormularContext.Provider>
    )

}

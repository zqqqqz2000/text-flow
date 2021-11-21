import { InputGroup } from "@chakra-ui/input";
import React, { ReactNode, useRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export type FileUploadProps = {
    register: UseFormRegisterReturn
    accept?: string
    onUpload?: (e: React.FormEvent) => void
    multiple?: boolean
    children?: ReactNode
};


export const FileUpload = (props: FileUploadProps) => {
    const { register, accept, multiple, children } = props
    const inputRef = useRef<HTMLInputElement | null>(null)
    const { ref, ...rest } = register as { ref: (instance: HTMLInputElement | null) => void }
    const handleClick = () => inputRef.current?.click();
    return <InputGroup onClick={handleClick} onChange={props.onUpload}>
        <input
            type={'file'}
            multiple={multiple || false}
            hidden
            accept={accept}
            {...rest}
            ref={(e) => {
                ref(e)
                inputRef.current = e
            }}
        />
        <>
            {children}
        </>
    </InputGroup>;
};
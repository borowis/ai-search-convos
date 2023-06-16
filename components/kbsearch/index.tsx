"use client"
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { set, useForm } from "react-hook-form"
import * as z from "zod"
import { remark } from 'remark';
import html from 'remark-html';
import remarkExternalLinks from 'remark-external-links'
 
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from "@/components/react-hook-form/form"

import HelpScout from "@helpscout/javascript-sdk";

const FormSchema = z.object({
  query: z.string().min(2, {
    message: "query must be at least 6 characters.",
  }),
})


export default function KbSearch(): React.JSX.Element {
    const [response, setResponse] = useState<string | undefined>("");
    const [htmlResponse, setHtmlResponse] = useState<string | undefined>("");
    const [isAuthed, setIsAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | undefined>();
    
    useEffect(() => {
        HelpScout.getApplicationContext().then(({ user }) =>
          setUserEmail(user?.email)
        );
      }, []);

    useEffect(() => {
        if (userEmail) {
            setIsAuthed(true)
        }
      }, [userEmail]);

    
      useEffect(() => {
        if (response) {
          const processedContent = remark()
          .use(remarkExternalLinks, {target: '_blank', rel: ['nofollow']})
          .use(html)
          .process(response);
          processedContent.then((data) => setHtmlResponse(data.toString())).catch((err) => console.log(err));
        }
      }, [response]);
    
    
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
      setResponse(undefined)
      setIsLoading(true)

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: data.query,
        }),
      })

      if (!response.ok) {
        setIsLoading(false);
        throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const aiData = response.body;
      if (!aiData) {
        setIsLoading(false);
        return;
      }

      const reader = aiData.getReader();
      const decoder = new TextDecoder();
      let done = false;

      setIsLoading(false);
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        setResponse((prev) => {
          if (!prev) {
            return chunkValue;
          }
          return prev + chunkValue
        });
      }
    }

    if (true) {
        return (
        <section className="container grid items-center px-0">
            <div className="flex flex-col items-start gap-2">
            <h2 className="leading-tight tracking-tighter">
            Ask Your Help Scout Related Questions Here.
            </h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full px-1">
                    <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input disabled={isLoading} placeholder="ask your question" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </form>
            </Form>
            <div className="space-y-2 pt-4">
                {isLoading && (
                <>
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[240px]" />
                </>
                )}
                {htmlResponse && (
                  <div className="aiResponse pt-4 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: htmlResponse }}/>
                )}
            </div>
            </div>
        </section>
        )
    }
    return <></>
  }
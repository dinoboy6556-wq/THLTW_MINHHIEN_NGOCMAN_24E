"use client";
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import api,{getErrorMessage} from '@/lib/axios';
export default function StaticPage(){const {slug}=useParams();const [page,setPage]=useState(null);const [error,setError]=useState('');useEffect(()=>{api.get(`/pages/${slug}`).then(r=>setPage(r.data?.data)).catch(e=>setError(getErrorMessage(e)))},[slug]);if(error)return <main className="p-16 text-center">Không tìm thấy trang hoặc trang chưa được xuất bản.</main>;if(!page)return <main className="p-16 text-center">Đang tải…</main>;return <main className="mx-auto max-w-4xl px-4 py-12"><h1 className="mb-6 text-3xl font-bold">{page.title}</h1><article className="whitespace-pre-wrap leading-8">{page.content}</article></main>}

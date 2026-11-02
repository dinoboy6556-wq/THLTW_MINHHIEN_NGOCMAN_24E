"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/axios";

const definitions = {
  pages: { title: "Trang tĩnh", fields: ["title", "content"], blank: { title: "", content: "", is_published: false } },
  banners: { title: "Banner", fields: ["title", "image_url", "target_url", "sort_order"], blank: { title: "", image_url: "", target_url: "", sort_order: 0, is_active: true } },
  "post-categories": { title: "Chủ đề bài viết", fields: ["name", "description"], blank: { name: "", description: "", is_active: true } },
  settings: { title: "Cấu hình website", fields: ["key", "value"], blank: { key: "", value: "" } },
};

export default function AdminContentPage() {
  const [resource, setResource] = useState("pages");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(definitions.pages.blank);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const def = definitions[resource];
  const load = useCallback(async () => {
    try { const r = await api.get(`/admin/${resource}`, { params: { keyword, per_page: 100 } }); setRows(r.data?.data?.data || []); setError(""); }
    catch (e) { setError(getErrorMessage(e)); }
  }, [resource, keyword]);
  useEffect(() => { queueMicrotask(load); }, [load]);
  const changeResource = (value) => { setResource(value); setForm(definitions[value].blank); setEditing(null); };
  const save = async (e) => { e.preventDefault(); try { if (editing) await api.put(`/admin/${resource}/${editing}`, form); else await api.post(`/admin/${resource}`, form); setForm(def.blank); setEditing(null); await load(); } catch (e) { setError(getErrorMessage(e)); } };
  const remove = async (id) => { if (!confirm("Xóa mục này?")) return; try { await api.delete(`/admin/${resource}/${id}`); await load(); } catch (e) { setError(getErrorMessage(e)); } };
  return <section className="space-y-5"><header><h1 className="text-2xl font-bold">Nội dung và cấu hình</h1><p className="text-sm text-gray-500">Quản lý trang tĩnh, banner, chủ đề bài viết và thông tin website.</p></header>
    <div className="flex flex-wrap gap-2">{Object.entries(definitions).map(([key, item]) => <button key={key} onClick={() => changeResource(key)} className={`rounded-lg px-4 py-2 text-sm ${resource===key?"bg-indigo-600 text-white":"border bg-white"}`}>{item.title}</button>)}</div>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={save} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">{def.fields.map((key) => <label key={key} className="text-sm capitalize">{key}<textarea required={!key.includes("description")&&!key.includes("target_url")} rows={key==="content"||key==="value"?4:1} value={form[key]??""} onChange={e=>setForm({...form,[key]:key==="sort_order"?Number(e.target.value):e.target.value})} className="mt-1 w-full rounded border p-2" /></label>)}{resource!=="settings"&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={resource==="pages"?form.is_published:form.is_active} onChange={e=>setForm({...form,[resource==="pages"?"is_published":"is_active"]:e.target.checked})}/>Đang hiển thị</label>}<div className="flex gap-2"><button className="rounded bg-indigo-600 px-4 py-2 text-white">{editing?"Lưu thay đổi":"Thêm mới"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(def.blank)}} className="rounded border px-4">Hủy</button>}</div></form>
    <input placeholder="Tìm kiếm" value={keyword} onChange={e=>setKeyword(e.target.value)} className="w-full rounded border bg-white p-3"/>
    <div className="space-y-2">{rows.map(row=><article key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"><div><b>{row.title||row.name||row.key}</b><p className="max-w-3xl truncate text-sm text-gray-500">{row.content||row.value||row.image_url||row.description}</p></div><div className="flex gap-3"><button onClick={()=>{setEditing(row.id);setForm(Object.fromEntries([...def.fields.map(k=>[k,row[k]??""]),["is_active",row.is_active],["is_published",row.is_published]]))}} className="text-indigo-600">Sửa</button>{resource!=="settings"&&<button onClick={()=>remove(row.id)} className="text-red-600">Xóa</button>}</div></article>)}</div>
  </section>;
}

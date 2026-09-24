import { useEffect,useRef,useState } from "react";
import { useNavigate,useSearch } from "@tanstack/react-router";
import { Rb142Inspector } from "../rb142/Rb142Inspector";
import { WorkItemInspector } from "../work-items/components/WorkItemInspector";
import { WorkItemCollectionLayout } from "../work-items/components/WorkItemCollection";
import { isEditableTarget } from "../work-items/keyboard";
import { MyWorkCollection,MyWorkFailure,MyWorkLoading } from "./components/MyWorkCollection";
import { MyWorkToolbar } from "./components/MyWorkToolbar";
import { useMyWork } from "./queries";
import "./my-work.css";
const CURRENT_USER_ID="user-muhammad-y",PRODUCT_WORKSPACE_ID="workspace-product";
export function MyWorkPage(){
 const search=useSearch({from:"/my-work"});const navigate=useNavigate({from:"/my-work"});const [selectedWorkItemId,setSelectedWorkItemId]=useState<string|undefined>(search.selected);const [checkedWorkItemIds,setCheckedWorkItemIds]=useState<Set<string>>(()=>new Set());const lastFocusedId=useRef<string|undefined>(undefined);
 const query=useMyWork({userId:CURRENT_USER_ID,workspaceId:PRODUCT_WORKSPACE_ID,...(search.q===undefined?{}:{search:search.q}),statusFilter:search.status,group:search.group,sort:search.sort});
 const openInspector=(id:string)=>{lastFocusedId.current=id;setSelectedWorkItemId(id);void navigate({search:previous=>({...previous,selected:id}),replace:true})};
 const closeInspector=()=>{const restore=lastFocusedId.current??selectedWorkItemId;void navigate({search:previous=>({...previous,selected:undefined}),replace:true});requestAnimationFrame(()=>restore&&document.querySelector<HTMLElement>(`[data-row-id="${restore}"]`)?.focus())};
 const setChecked=(id:string,checked:boolean)=>setCheckedWorkItemIds(current=>{const next=new Set(current);if(checked)next.add(id);else next.delete(id);return next});
 useEffect(()=>setSelectedWorkItemId(search.selected),[search.selected]);useEffect(()=>{const handler=(event:globalThis.KeyboardEvent)=>{if(event.key!=="Escape"||!search.selected||isEditableTarget(event.target))return;event.preventDefault();closeInspector()};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)});
 const inspector=search.selected==="wi-rb-142"?<Rb142Inspector onClose={closeInspector}/>:search.selected?<WorkItemInspector id={search.selected} onClose={closeInspector}/>:undefined;const hasActiveFilter=Boolean(search.q)||search.status!=="not-done";
 return <div className="work-items-page my-work-page"><header className="project-context my-work-context"><div><span className="eyebrow">Personal retrieval</span><h1>My Work</h1><p>Assigned to me · Product workspace</p></div></header><MyWorkToolbar q={search.q} status={search.status} group={search.group} sort={search.sort} count={query.data?.totalCount} onStatus={()=>void navigate({search:p=>({...p,status:p.status==="all"?"not-done":"all"}),replace:true})} onGroup={group=>void navigate({search:p=>({...p,group}),replace:true})} onSort={sort=>void navigate({search:p=>({...p,sort}),replace:true})} onSearch={q=>void navigate({search:p=>({...p,q:q||undefined}),replace:true})}/><WorkItemCollectionLayout inspectorOpen={Boolean(search.selected)} inspector={inspector}>{query.isLoading?<MyWorkLoading/>:query.isError?<MyWorkFailure/>:query.data?<MyWorkCollection data={query.data} selectedWorkItemId={selectedWorkItemId} checkedWorkItemIds={checkedWorkItemIds} hasActiveFilter={hasActiveFilter} onContextSelect={setSelectedWorkItemId} onCheckedChange={setChecked} onOpen={openInspector} onReset={()=>void navigate({search:{status:"not-done",group:"due",sort:"priority"},replace:true})}/>:null}</WorkItemCollectionLayout></div>
}

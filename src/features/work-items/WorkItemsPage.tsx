import { useEffect,useRef,useState } from "react";
import { useNavigate,useParams,useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Rb142Inspector } from "../rb142/Rb142Inspector";
import "../rb142/rb142.css";
import { WorkItemInspector } from "./components/WorkItemInspector";
import { WorkItemTable } from "./components/WorkItemTable";
import { WorkItemCollectionEmpty,WorkItemCollectionFailure,WorkItemCollectionLayout,WorkItemCollectionLoading,WorkItemCollectionStale } from "./components/WorkItemCollection";
import { isEditableTarget } from "./keyboard";
import { useWorkItemCollection } from "./queries";

export function WorkItemsPage(){
 const {projectId}=useParams({from:"/projects/$projectId/issues"});const search=useSearch({from:"/projects/$projectId/issues"});const navigate=useNavigate({from:"/projects/$projectId/issues"});
 const [selectedWorkItemId,setSelectedWorkItemId]=useState<string|undefined>(search.selected);const [checkedWorkItemIds,setCheckedWorkItemIds]=useState<Set<string>>(()=>new Set());const lastFocusedId=useRef<string|undefined>(undefined);
 const query=useWorkItemCollection({projectId,...(search.q===undefined?{}:{search:search.q}),statusFilter:search.status,sort:search.sort});
 const setChecked=(id:string,checked:boolean)=>setCheckedWorkItemIds(current=>{const next=new Set(current);if(checked)next.add(id);else next.delete(id);return next});
 const openInspector=(id:string)=>{lastFocusedId.current=id;setSelectedWorkItemId(id);void navigate({search:previous=>({...previous,selected:id}),replace:true})};
 const closeInspector=()=>{const restore=lastFocusedId.current??selectedWorkItemId;void navigate({search:previous=>({...previous,selected:undefined}),replace:true});requestAnimationFrame(()=>restore&&document.querySelector<HTMLElement>(`[data-row-id="${restore}"]`)?.focus())};
 useEffect(()=>setSelectedWorkItemId(search.selected),[search.selected]);
 useEffect(()=>{const handler=(event:globalThis.KeyboardEvent)=>{if(event.key!=="Escape"||!search.selected||isEditableTarget(event.target))return;event.preventDefault();closeInspector()};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)});
 const inspector=search.selected==="wi-rb-142"?<Rb142Inspector onClose={closeInspector}/>:search.selected?<WorkItemInspector id={search.selected} onClose={closeInspector}/>:undefined;
 return <div className="work-items-page"><header className="project-context"><div><span className="eyebrow">Platform Core</span><h1>Issues</h1></div><button className="new-issue" type="button">New issue</button></header><div className="work-toolbar" aria-label="Work Item collection controls"><label className="search-field"><Search size={14}/><span className="sr-only">Search Work Items</span><input value={search.q??""} placeholder="Search issues…" onChange={e=>void navigate({search:previous=>({...previous,q:e.target.value||undefined}),replace:true})}/></label><button type="button" className="filter-chip" aria-pressed={search.status==="not-done"} onClick={()=>void navigate({search:previous=>({...previous,status:previous.status==="all"?"not-done":"all"}),replace:true})}>Status ≠ Done</button><select aria-label="Sort Work Items" value={search.sort} onChange={e=>void navigate({search:previous=>({...previous,sort:e.target.value as "key"|"title"|"priority"}),replace:true})}><option value="key">Sort: Key</option><option value="title">Sort: Title</option><option value="priority">Sort: Priority</option></select><span className="collection-count">{query.data?.totalCount.toLocaleString()??"—"} issues</span></div><WorkItemCollectionLayout inspectorOpen={Boolean(search.selected)} inspector={inspector}>{query.isLoading?<WorkItemCollectionLoading/>:query.isError?<WorkItemCollectionFailure/>:query.data?.items.length===0?<WorkItemCollectionEmpty title="No Work Items" description="Adjust the current search or filter."/>:query.data?<>{query.data.stale&&<WorkItemCollectionStale>Showing cached data while connectivity is limited.</WorkItemCollectionStale>}<WorkItemTable items={query.data.items} selectedWorkItemId={selectedWorkItemId} checkedWorkItemIds={checkedWorkItemIds} onContextSelect={setSelectedWorkItemId} onCheckedChange={setChecked} onOpen={openInspector}/></>:null}</WorkItemCollectionLayout></div>
}

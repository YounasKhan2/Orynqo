import type { ReactNode } from "react";
import { InlineAlert } from "../../../design-system/primitives";
export function WorkItemCollectionLayout({inspectorOpen,children,inspector}:{inspectorOpen:boolean;children:ReactNode;inspector?:ReactNode}){return <div className={inspectorOpen?"collection-layout inspector-open":"collection-layout"}><section className="collection-panel">{children}</section>{inspector}</div>}
export function WorkItemCollectionLoading({label="Loading Work Items"}:{label?:string}){return <div className="table-skeleton" aria-label={label}>{Array.from({length:10},(_,i)=><div key={i} className="skeleton-row"><span/><span/><span/><span/></div>)}</div>}
export function WorkItemCollectionFailure({children="Could not load Work Items. Your collection context is preserved."}:{children?:ReactNode}){return <InlineAlert role="alert">{children}</InlineAlert>}
export function WorkItemCollectionStale({children}:{children:ReactNode}){return <InlineAlert>{children}</InlineAlert>}
export function WorkItemCollectionEmpty({title,description,action}:{title:string;description:string;action?:ReactNode}){return <div className="collection-empty"><strong>{title}</strong><span>{description}</span>{action}</div>}

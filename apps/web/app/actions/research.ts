'use server';import {redirect} from 'next/navigation';
export async function researchStore(projectId:string,formData:FormData){const url=String(formData.get('url')||'').trim();if(!url)redirect(`/projects/${projectId}/research?error=${encodeURIComponent('Enter a public store URL.')}`);redirect(`/projects/${projectId}/research?url=${encodeURIComponent(url)}`)}

import ChapterStat from './Components/ChapterStat';
import CreatePresidentForm from './Components/CreatePresident';
import PresidentRoleManagement from './Components/PresidentRole';
import MemberDetailes from './Components/Memberdetails';
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { BiLeftArrow } from 'react-icons/bi';

const ChapterDetails = () => {
    const { id } = useParams();
    const [chapter, setChapter] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/chapter/main/getchapterbyid/${id}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setChapter(data);
                }
            } catch (error) {
                console.error('Failed to fetch chapter:', error);
            }
        };
        fetchChapter();
    }, [id]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-6 flex flex-row items-center gap-5">
                <button className='flex flex-col items-start justify-end pt-8' onClick={() => nav(-1)}>
                    <BiLeftArrow size={30} className='text-rose-500 cursor-pointer' />
                    <p className='text-lg text-rose-500 cursor-pointer'>Back</p>
                </button>
                <h1 className="text-3xl font-bold dark:text-white">
                    {chapter ? `${chapter.chapter_name} Chapter` : '(Chapter Name)'}
                </h1>
            </div>
            <ChapterStat chapterid={id} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full">
                    <CreatePresidentForm chapterName={chapter ? chapter.chapter_name : ""} />
                </div>
                <div className="w-full">
                    <PresidentRoleManagement chapterId={chapter ? chapter._id : null} />
                </div>
            </div>
            <div className="mt-10">
                <MemberDetailes chapterId={chapter ? chapter._id : null} />
            </div>
        </div>
    );
};

export default ChapterDetails;
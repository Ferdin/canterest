import { Folder, Images, Plus, X } from "lucide-react";
import UploadMediaTextInput from "../PinCreationToolElements/UploadMediaElements/UploadMediaTextInput";
import UploadMediaTextArea from "../PinCreationToolElements/UploadMediaElements/UploadMediaTextArea";
import UploadMediaGenericComboBox,{ type ComboBoxItem } from "../PinCreationToolElements/UploadMediaElements/UploadMediaGenericComboBox";
import { useState, useRef } from "react";
import { useCreatePinMutation, useGetMyDraftsQuery, useUpdatePinMutation, useUploadMediaMutation, type PinOut } from "../../features/pins/pinsApi";
import Loading from "../MiscAnimatedComponents/Loading";

interface Board extends ComboBoxItem {}
interface Topic extends ComboBoxItem {}

const boards: Board[] = [
    { id: 1, name: "Web Development" },
    { id: 2, name: "Travel" },
    { id: 3, name: "Photography" },
    { id: 4, name: "Food" },
    { id: 5, name: "Interior Design" },
];

const topics: Topic[] = [
    { id: 1, name: "Minimalism" },
    { id: 2, name: "DIY" },
    { id: 3, name: "Street Photography" },
    { id: 4, name: "Vegan" },
    { id: 5, name: "Small Space Living" },
];

export default function PinCreationTool(){
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [selectPins, setSelectPins] = useState<boolean>(false);

    // form state
    //const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [altText, setAltText] = useState<string>("");
    const [markAsAiModified, setMarkAsAiModified] = useState<boolean>(false);
    const [includesAiPerson, setIncludeAiPerson] = useState<boolean>(false);
    const [allowComments, setAllowComments] = useState<boolean>(true);
    const [showSimilarProducts, setShowSimilarProducts] = useState<boolean>(true);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadMedia] = useUploadMediaMutation();
    const [createPin] = useCreatePinMutation();
    const [updatePin] = useUpdatePinMutation();

    const [draftPinId, setDraftPinId] = useState<number | null>(null);

    const handleSelectPins = () => {
        setSelectPins((prev) => !prev)
    }

    const { data: drafts, isLoading: draftsLoading  } = useGetMyDraftsQuery();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        //setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setErrorMsg(null);

        try {
            const formData = new FormData();
            formData.append("file", selected);
            const { media_url } = await uploadMedia(formData).unwrap();

            // create as a draft immediatedly, before any other field is filled in
            const draft = await createPin({
                media_url,
                status: "draft",
            }).unwrap();

            setDraftPinId(draft.id);
        } catch (err: any) {
            setErrorMsg("Failed to upload media. Please try again.");
        }
    }

    const handleSelectDraft = (draft: PinOut) => {
        setDraftPinId(draft.id);
        setPreviewUrl(draft.media_url);
        setTitle(draft.title ?? "");
        setDescription(draft.description ?? "");
        setLink(draft.link ?? "");
        setAltText(draft.alt_text ?? "");
        setMarkAsAiModified(draft.mark_as_ai_modified ?? false);
        setIncludeAiPerson(draft.includes_ai_generated_person ?? false);
        setAllowComments(draft.allow_comments ?? true);
        setShowSimilarProducts(draft.show_similar_products ?? true);

        // board/topics need matching against your local `boards` /`topics` lists
        // since the draft only stores board_id / topic names, not full objects
        const matchedBoard = boards.find((b) => b.id === draft.board_id) ?? null;
        setSelectedBoard(matchedBoard);

        const matchedTopics = topics.filter((t) => draft.topics?.includes(t.name));
        setSelectedTopics(matchedTopics);

        setErrorMsg(null);
        setSelectPins(false);
    }

    const handlePublish = async () => {
        if (!draftPinId) {
            setErrorMsg("Please upload media before publishing.");
            return;
        }
        setErrorMsg(null);

        // if(!file) {
        //     setErrorMsg("Please upload media before publishing");
        //     return;
        // }

        try {
            // const formData = new FormData();
            // formData.append("file", file);
            // const { media_url } = await uploadMedia(formData).unwrap();

            await updatePin({
                id: draftPinId,
                updates: {
                    status: "published",
                    title: title || undefined,
                    description: description || undefined,
                    link: link || undefined,
                    board_id: selectedBoard?.id,
                    topics: selectedTopics.map((t) => t.name),
                    alt_text: altText || undefined,
                    mark_as_ai_modified: markAsAiModified,
                    includes_ai_generated_person: includesAiPerson,
                    allow_comments: allowComments,
                    show_similar_products: showSimilarProducts,
                },
            }).unwrap();

            // reset form on success
            // setFile(null);
            setPreviewUrl(null);
            setDraftPinId(null);
            setTitle("");
            setDescription("");
            setLink("");
            setAltText("");
            setSelectedBoard(null);
            setSelectedTopics([]);
        } catch (err: any) {
            const detail = err?.data?.detail;
            setErrorMsg(
                typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                ? detail[0]?.msg
                : "Failed to publish pin. Please try again."
            );
        }
    };

    //const isSubmitting = uploading || publishing;

    return (
    <div className="flex flex-row min-h-screen">
        <div className={`${selectPins ? "w-[80%]" : "w-[95%]"} `}>
            <div className="flex justify-between items-center px-2 py-4 border-b-olive-300 border-t-olive-300 border-b border-t sticky top-20 z-10 bg-white">
                <h2 className="font-bold text-2xl">Create Pin</h2>
                {previewUrl && <button className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 cursor-pointer font-semibold rounded-lg" onClick={handlePublish}>Publish</button>}
            </div>
            {errorMsg && (
                <div className="px-56 pt-4 text-sm text-red-600">{errorMsg}</div>
            )}
            <div className="px-56 pt-10 flex flex-row gap-8 mb-4">
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg, image/png, video/mp4"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()} 
                        className={`relative w-96 h-96 ${previewUrl ? "": "bg-olive-300 border rounded-2xl py-10"} flex  cursor-pointer`}
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-2xl "
                            />
                        ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full pb-12">
                            <Images/>
                            <span className="font-semibold mt-2">Upload your media</span>
                            <p className="text-center text-sm text-gray-500 pt-2">Select multiple files in your file<br/>picker with Shift or Cmd/Ctrl.</p>
                            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 w-full px-4">JPG, PNG up to 20MB · MP4 up to 200MB</p>
                        </div>
                        )}
                    </div>
                    {!previewUrl && (
                        <>
                        <hr className="border-olive-300 my-6  w-96" />
                        <div className="w-96 h-12 bg-olive-300 flex border rounded-2xl cursor-pointer hover:bg-olive-400">
                            <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                                Save from URL
                            </div>
                        </div>
                        </>
                    )}
                </div>
                <div className="flex flex-col gap-6">
                    <UploadMediaTextInput 
                        name="can_pin_title" 
                        placeholder="Tell everyone what your Pin is about" 
                        id="can_pin_title" 
                        labelText="Title"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        disabled={previewUrl ? false : true}
                    />
                    <UploadMediaTextArea 
                        name="can_pin_desc" 
                        placeholder="Describe your Pin" 
                        id="can_pin_desc" 
                        labelText="Description"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        disabled={previewUrl ? false : true}
                    />
                    <UploadMediaTextInput 
                        name="can_pin_link" 
                        placeholder="Add a Link" 
                        id="can_pin_link" 
                        labelText="Link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        disabled={previewUrl ? false : true}
                    />
                    <UploadMediaGenericComboBox
                        items={boards}
                        label="Board"
                        name="can_pin_board"
                        id="can_pin_board"
                        placeholder="Search for a board."
                        value={selectedBoard}
                        onChange={(value) => setSelectedBoard(value as Board | null)}
                        onCreateNew={(query) => {
                            // POST /boards, then push the new board into `boards`
                            console.log("Create new board:", query);
                        }}
                        createLabel={() => "Create new board"}
                        renderIcon={() => <span>📌</span>}
                        disabled={previewUrl ? false : true}
                        />
                    <UploadMediaGenericComboBox
                        items={topics}
                        label="Topics"
                        name="tagged_topics"
                        id="tagged_topics"
                        placeholder="Search for topics to tag."
                        multiple
                        value={selectedTopics}
                        onChange={(value) => setSelectedTopics(value as Topic[])}
                        onCreateNew={(query) => {
                            console.log("Create new topic:", query);
                        }}
                        createLabel={(query) => `Add "${query}" as a topic`}
                        renderIcon={() => <span>#</span>}
                        disabled={previewUrl ? false : true}
                        />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold">Tag Products</span>
                        <button className="text-sm font-semibold bg-olive-200 py-1 w-48 rounded-lg mt-2">Add Products</button>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div>
                            <label className="relative inline-block w-15 h-8.5">
                                <input 
                                    type="checkbox" 
                                    className="peer opacity-0 w-0 h-0"
                                    checked={markAsAiModified}
                                    onChange={(e) => setMarkAsAiModified(e.target.checked)} 
                                    disabled={previewUrl ? false : true}
                                />
                                <span className={`absolute ${previewUrl ? "cursor-pointer" : ""} inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5`}>
                                </span>
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold mt-1">Mark as AI-Modified</h3>
                            <span className="text-sm text-olive-500">Content that was made completely or partly with AI</span>
                            <div className="flex gap-2">
                                <input 
                                    type="checkbox"
                                    checked={includesAiPerson}
                                    onChange={(e) => setIncludeAiPerson(e.target.checked)}
                                    disabled={previewUrl ? false : true}
                                />
                                <span className="text-sm">This Pin includes an AI-generated person</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div>
                            <label className="relative inline-block w-15 h-8.5">
                                <input 
                                    type="checkbox" 
                                    className="peer opacity-0 w-0 h-0"
                                    checked={allowComments}
                                    onChange={(e) => setAllowComments(e.target.checked)} 
                                    disabled={previewUrl ? false : true}
                                />
                                <span className={`absolute ${previewUrl ? "cursor-pointer" : ""} inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5`}>
                                </span>
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold mt-1">Allow people to comment</h3>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 w-lg">
                        <div>
                            <label className="relative inline-block w-15 h-8.5">
                                <input 
                                    type="checkbox" 
                                    className="peer opacity-0 w-0 h-0"
                                    checked={showSimilarProducts}
                                    onChange={(e) => setShowSimilarProducts(e.target.checked)} 
                                    disabled={previewUrl ? false : true}
                                />
                                <span className={`absolute ${previewUrl ? "cursor-pointer" : ""} inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5`}>
                                </span>
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold mt-1">Show similar products</h3>
                            <p className="text-sm text-olive-500">People can shop products similar to what's shown in this Pin using visual search
                            Shopping recommendations aren't available for Idea ads and Pins with tagged products or paid partnership label</p>
                        </div>
                    </div>
                    <div className="relative w-lg">
                        <textarea 
                            name="can_pin_alt_desc" 
                            placeholder="Describe your Pin's visual details"
                            id="can_pin_alt_desc"
                            className={`peer border-gray-300 ${previewUrl ? "" : "bg-olive-300"} border rounded-2xl h-18 w-full px-4 pt-7 pb-1 outline-none text-base transition-all resize-none`}
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            disabled={previewUrl ? false : true}
                            />
                        <label
                            htmlFor="can_pin_alt_desc"
                            className="absolute left-4 top-2 text-xs font-semibold text-gray-80000 pointer-events-none"
                            >
                            Alt Text
                        </label>
                        <p className="text-xs w-full text-center">This helps people using screen readers understand what your Pin is about</p>
                    </div>
                </div>
            </div>
        </div>
        <div className={`${selectPins ? "w-[20%]" : "w-[5%]"} h-[calc(100vh-(--spacing(20)))] overflow-y-auto border border-olive-300 flex flex-col pt-4 sticky top-20 bg-white`}>
            {!selectPins  ? (<div className="w-full flex flex-col justify-center">
                <div className="relative inline-flex items-center justify-center cursor-pointer" onClick={handleSelectPins}>
                    <Folder className="w-12 h-12 " strokeWidth={1.5}/>
                    <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {drafts?.length ?? 0}
                    </span>
                </div>
                <div className="relative inline-flex items-center justify-center py-4">
                    <Plus className="w-8 h-8 cursor-pointer"/>
                </div>
            </div>) :
            (<div className="flex flex-col">
                <div className="flex justify-between items-center px-4 py-2">
                    <h2 className="font-semibold text-lg">Pin drafts {drafts?.length ?? 0}</h2>
                    <X onClick={handleSelectPins} className="cursor-pointer"/>
                </div>
                <div className="flex justify-center">
                    <button className="font-medium bg-olive-200 w-full rounded-lg mx-4 my-4 py-2">Create a Pin</button>
                </div>
                <hr className="mt-2 border-olive-300"/>    
                <div>
                    {draftsLoading && (
                        <Loading/>
                    )}
                    {!draftsLoading && drafts?.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No drafts yet.</p>
                    )}
                    {drafts?.map((draft) => (
                        <div
                            key={draft.id}
                            onClick={() => handleSelectDraft(draft)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-olive-100 cursor-pointer"
                        >
                            <img
                                src={draft.media_url}
                                alt={draft.title || "Untitled draft"}
                                className="w-12 h-12 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">
                                    {draft.title || "Untitled"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {draft.days_until_expiration === 0
                                        ? "Expires today"
                                        : `Expires in ${draft.days_until_expiration} day${
                                            draft.days_until_expiration === 1 ? "" : "s"
                                        }`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>)}
        </div>
    </div>
    );
}
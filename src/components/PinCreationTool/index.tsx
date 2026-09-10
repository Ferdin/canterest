import { Folder, Images, Plus, X } from "lucide-react";
import UploadMediaTextInput from "../PinCreationToolElements/UploadMediaElements/UploadMediaTextInput";
import UploadMediaTextArea from "../PinCreationToolElements/UploadMediaElements/UploadMediaTextArea";
import UploadMediaGenericComboBox,{ type ComboBoxItem } from "../PinCreationToolElements/UploadMediaElements/UploadMediaGenericComboBox";
import { useState, useRef } from "react";
import { useCreatePinMutation, useUploadMediaMutation } from "../../features/pins/pinsApi";

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
    const [file, setFile] = useState<File | null>(null);
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

    const handleSelectPins = () => {
        setSelectPins((prev) => !prev)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    }

    const handlePublish = async () => {
        setErrorMsg(null);

        if(!file) {
            setErrorMsg("Please upload media before publishing");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            const { media_url } = await uploadMedia(formData).unwrap();

            await createPin({
                media_url,
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
            }).unwrap();

            // reset form on success
            setFile(null);
            setPreviewUrl(null);
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
            <div className="flex justify-between items-center px-2 py-4 border-b-olive-300 border-b">
                <h2 className="font-bold text-2xl">Create Pin</h2>
                <button className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 cursor-pointer font-semibold rounded-lg" onClick={handlePublish}>Publish</button>
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
                        className="relative w-96 h-96 bg-olive-300 flex border rounded-2xl py-10 cursor-pointer"
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
                    <hr className="border-olive-300 my-6  w-96" />
                    <div className="w-96 h-12 bg-olive-300 flex border rounded-2xl cursor-pointer hover:bg-olive-400">
                        <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                            Save from URL
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <UploadMediaTextInput 
                        name="can_pin_title" 
                        placeholder="Tell everyone what your Pin is about" 
                        id="can_pin_title" 
                        labelText="Title"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />
                    <UploadMediaTextArea 
                        name="can_pin_desc" 
                        placeholder="Describe your Pin" 
                        id="can_pin_desc" 
                        labelText="Description"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    />
                    <UploadMediaTextInput 
                        name="can_pin_link" 
                        placeholder="Add a Link" 
                        id="can_pin_link" 
                        labelText="Link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
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
                                />
                                <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5">
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
                                />
                                <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5">
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
                                />
                                <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full
                                            peer-checked:bg-blue-500
                                            peer-focus:shadow-[0_0_1px_#2196F3]
                                            before:content-[''] before:absolute before:h-6.5 before:w-6.5 before:left-1 before:bottom-1
                                            before:bg-white before:transition-all before:duration-400 before:rounded-full
                                            peer-checked:before:translate-x-6.5">
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
                            className="peer border-gray-300 border rounded-2xl h-18 w-full px-4 pt-7 pb-1 outline-none text-base transition-all resize-none"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
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
        <div className={`${selectPins ? "w-[20%]" : "w-[5%]"}  border border-olive-300 flex flex-col pt-4`}>
            {!selectPins  ? (<div className="w-full flex flex-col justify-center">
                <div className="relative inline-flex items-center justify-center cursor-pointer" onClick={handleSelectPins}>
                    <Folder className="w-12 h-12 " strokeWidth={1.5}/>
                    <span className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        1
                    </span>
                </div>
                <div className="relative inline-flex items-center justify-center py-4">
                    <Plus className="w-8 h-8 cursor-pointer"/>
                </div>
            </div>) :
            (<div className="flex flex-col">
                <div className="flex justify-between items-center px-4 py-2">
                    <h2 className="font-semibold text-lg">Pin drafts (1)</h2>
                    <X onClick={handleSelectPins} className="cursor-pointer"/>
                </div>
                <div className="flex justify-center">
                    <button className="font-medium bg-olive-200 w-full rounded-lg mx-4 my-4 py-2">Create a Pin</button>
                </div>
                <hr className="mt-2 border-olive-300"/>    
            </div>)}
        </div>
    </div>
    );
}
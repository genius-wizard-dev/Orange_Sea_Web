import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

type EditMessageDialogProps = {
    open: boolean;
    initialContent: string;
    onClose: () => void;
    onSave: (newContent: string) => void;
};

export const EditMessageDialog: React.FC<EditMessageDialogProps> = ({
    open,
    initialContent,
    onClose,
    onSave,
}) => {
    const [content, setContent] = useState(initialContent ?? "");
    useEffect(() => {
        console.log("EditMessageDialog nhận initialContent:", initialContent);
        setContent(initialContent ?? "");
    }, [initialContent, open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa tin nhắn</DialogTitle>
                </DialogHeader>
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung mới..."
                />
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => onSave(content)}
                        disabled={!content || !content.trim()}
                    >
                        Lưu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PasswordInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<typeof Input>>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="auth-password">
        <Input {...props} ref={ref} type={visible ? "text" : "password"} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
export default PasswordInput;

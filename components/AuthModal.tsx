// @/components/AuthModal.tsx
import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Checkbox,
  Input,
  Tooltip,
} from "@nextui-org/react";
import useAuth from "@/hooks/useAuth";
import { MailIcon, EyeOff, Eye, KeyRound } from "lucide-react";

const AuthModal: React.FC = () => {
  const {
    isAuthenticated,
    isModalOpen,
    closeModal,
    handleLogIn,
    submitVerificationCode,
    authStage,
    authMessage,
    isSubmitting,
  } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isRemember, setIsRemember] = useState<boolean>(false);

  const [code, setCode] = useState<string>("");

  const handleShowPassword = () => setShowPassword(!showPassword);

  const isCodeStep = authStage === "verifyCode" || authStage === "tfa";
  const codeLabel = authStage === "tfa" ? "MFA Code" : "Verification Code";

  return (
    <>
      {!isAuthenticated && isModalOpen && (
        <Modal
          backdrop="opaque"
          isOpen={isModalOpen}
          onClose={closeModal}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
          hideCloseButton={true}
          className="bg-primary-800"
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1 font-extralight">
                  {isCodeStep
                    ? "Enter your verification code"
                    : "Please sign in to retrieve your Bambu token"}
                </ModalHeader>

                <ModalBody>
                  {!isCodeStep ? (
                    <>
                      <Input
                        autoFocus
                        endContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                        label="Email"
                        placeholder="Enter your email"
                        variant="bordered"
                        color="secondary"
                        onValueChange={setEmail}
                      />
                      <Input
                        endContent={
                          <div onClick={handleShowPassword}>
                            {showPassword ? (
                              <EyeOff className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                            ) : (
                              <Eye className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                            )}
                          </div>
                        }
                        label="Password"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        variant="bordered"
                        color="secondary"
                        onValueChange={setPassword}
                      />

                      <div className="flex py-2 px-1 justify-between">
                        <Tooltip
                          placement="bottom"
                          className="bg-primary-400 dark:bg-primary-700"
                          content={
                            <div>
                              <p>If you choose "Remember me", the cookies will be stored 30 days.</p>
                              <p>If not, you will be logged out once the session is over (close the browser).</p>
                            </div>
                          }
                        >
                          <Checkbox
                            color="secondary"
                            classNames={{ label: "text-small" }}
                            isSelected={isRemember}
                            onValueChange={setIsRemember}
                          >
                            Remember me
                          </Checkbox>
                        </Tooltip>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        autoFocus
                        endContent={<KeyRound className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                        label={codeLabel}
                        placeholder="Enter the code"
                        variant="bordered"
                        color="secondary"
                        value={code}
                        onValueChange={setCode}
                      />
                      <p className="text-sm font-extralight opacity-80">
                        {authStage === "verifyCode"
                          ? "Check your email for the code Bambu sent you."
                          : "Enter the code from your authenticator app."}
                      </p>
                    </>
                  )}

                  {authMessage && <p className="text-red-300 text-sm">{authMessage}</p>}
                </ModalBody>

                <ModalFooter>
                  {!isCodeStep ? (
                    <Button
                      color="secondary"
                      isLoading={isSubmitting}
                      onPress={() => handleLogIn(email, password, isRemember)}
                    >
                      Log in
                    </Button>
                  ) : (
                    <Button
                      color="secondary"
                      isLoading={isSubmitting}
                      onPress={() => submitVerificationCode(code)}
                    >
                      Verify
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AuthModal;

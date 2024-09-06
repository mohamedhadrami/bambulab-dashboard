// @/components/AuthModal.tsx

import React, { useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, Checkbox, Input, Tooltip } from "@nextui-org/react";
import useAuth from '@/hooks/useAuth';
import { MailIcon, EyeOff, Eye } from 'lucide-react';

const AuthModal: React.FC = () => {
    const { isAuthenticated, isModalOpen, closeModal, handleLogIn } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isRemember, setIsRemember] = useState<boolean>(false)

    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <>
            {!isAuthenticated && isModalOpen && (
                <Modal backdrop="opaque" isOpen={isModalOpen} onClose={closeModal} isDismissable={false} isKeyboardDismissDisabled={true} hideCloseButton={true} className="bg-primary-800">
                    <ModalContent>
                        {() => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 font-extralight">Please sign in to retrieve your Bambu token</ModalHeader>
                                <ModalBody>
                                    <Input
                                        autoFocus
                                        endContent={
                                            <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                        }
                                        label="Email"
                                        placeholder="Enter your email"
                                        variant="bordered"
                                        color="secondary"
                                        onValueChange={setEmail}
                                    />
                                    <Input
                                        endContent={
                                            <div onClick={handleShowPassword}>
                                                {showPassword ?
                                                    <EyeOff className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                    :
                                                    <Eye className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                }
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
                                                    <p>
                                                        If you choose "Remember me", the cookies will be stored 30 days.
                                                    </p>
                                                    <p>
                                                        If not, you will be logged out, once the session is over (i.e. close the browser)
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <Checkbox
                                                color="secondary"
                                                classNames={{
                                                    label: "text-small",
                                                }}
                                                isSelected={isRemember}
                                                onValueChange={setIsRemember}
                                            >
                                                Remember me
                                            </Checkbox>
                                        </Tooltip>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="secondary" onPress={() => handleLogIn(email, password, isRemember)}>
                                        Log in
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal >
            )}
        </>
    );
};

export default AuthModal;

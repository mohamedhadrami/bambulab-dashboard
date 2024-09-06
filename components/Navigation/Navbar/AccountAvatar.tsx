// @/components/Navbar/AccountAvatar.tsx

import { BambuDevice, BambuProfile } from "@/types/bambuApi/bambuApi";
import { Avatar, NavbarItem, Link, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { UserRound } from "lucide-react";
import { NavigationItem } from "./Navbar";
import CustomNavbarMenu from "./NavbarMenu";

interface AccountAvatarProps {
  isLoggedIn: boolean;
  printers: BambuDevice[]
  navigation: NavigationItem[];
  profile: BambuProfile;
  pathname: any;
}

const AccountAvatar: React.FC<AccountAvatarProps> = ({ isLoggedIn, printers, navigation, profile, pathname }) => {

  const currentlyDisabled = ["projects"];

  return (
    <>
      {profile ? (
        <Popover placement="bottom-end">
          <NavbarItem>
            <PopoverTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                src={profile.avatar}
              />
            </PopoverTrigger>
          </NavbarItem>
          <PopoverContent
            aria-label="Profile actions"
            className="
              flex flex-col justify-start 
              p-4
              max-w-96
              bg-gradient-to-br from-primary-400 dark:from-primary-800 dark:to-primary-900
            "
          >
            <CustomNavbarMenu navigation={navigation} printers={printers} pathname={pathname} profile={profile} />
          </PopoverContent>
        </Popover>
      ) : (
        <Link href="/login" color="foreground" className="font-light text-xl flex items-center align-middle cursor-pointer text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-300">
          <UserRound />
        </Link>
      )}

    </>
  );
};

export default AccountAvatar;

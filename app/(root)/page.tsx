import { PrimaryButton } from "@/components/buttons/PrimaryButton";

export default function Home() {
  return (
    <div className="m-5 flex-col gap-4 flex items-center justify-center">
      {/* <PrimaryButton>Button</PrimaryButton>
      <SecondaryButton icon={<Sun size={14} />} iconPosition="right">
        Toggle Theme
      </SecondaryButton>

      <IconButton icon={<Sun size={14} />} />
      <CustomTooltip
        title="Important Info"
        description="This is a tooltip with detailed information about the feature."
        icon={<Info className="w-4 h-4 text-indigo-400" />}
      >
        <PrimaryButton icon={<Sun size={14} />} iconPosition="left">
          Tooltip
        </PrimaryButton>
      </CustomTooltip>
      <div className="mt-4 flex justify-end">
        <PrimaryButton onClick={() => setOpen(false)}>Close</PrimaryButton>
      </div>
      <CustomModal
        open={open}
        onOpenChange={setOpen}
        trigger={
          <PrimaryButton className="flex items-center gap-2">
            Open Modal
          </PrimaryButton>
        }
      >
        <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
          Modal Title
        </h3>
        <p className="text-[12px] mt-2 text-gray-600 dark:text-gray-300">
          This is the content inside the modal. You can put any component here.
        </p>
        <div className="mt-4 flex justify-end">
          <SecondaryButton onClick={() => setOpen(false)}>
            Close
          </SecondaryButton>
        </div>
      </CustomModal>

      <GuestLogin /> */}
      Home
      <PrimaryButton className="flex items-center gap-2">
        Open Modal
      </PrimaryButton>
    </div>
  );
}

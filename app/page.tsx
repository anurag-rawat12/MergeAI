import InputContainer from "@/components/InputContainer";

export default function Home() {
  return (
    <div className="flex flex-col gap-[20px] items-center justify-center min-h-screen py-2">
      <h1 className="lg:text-[2.5vw] text-[8vw] mt-[30vh] font-medium lg:mt-[20px]">What can I help with?</h1>

      <InputContainer/>

    </div>
  );
}

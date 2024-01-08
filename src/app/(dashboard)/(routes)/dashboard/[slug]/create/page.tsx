"use client"

import { QuizForm } from "@/app/(dashboard)/_components/forms/QuizForm";
import { useCreatePackage, useCreatePaket } from "@/app/(dashboard)/shared/queries";

interface Props {
    params: {
      slug: string;
    };
  }

const CreateQuiz: React.FC<Props> = ({ params }) => {
  const { mutateAsync, reset } = useCreatePaket();
//   console.log(params)
  const testName = params.slug
  return (
    <div>
      <h2 className="text-2xl font-medium text-center">Buat Paket</h2>
      <div className="mx-auto md:w-6/12 mt-10">
        <QuizForm
          redirect="/dashboard"
          mutateAsync={mutateAsync}
          reset={reset}
          testname={testName}
        />
      </div>
    </div>
  );
};

export default CreateQuiz;

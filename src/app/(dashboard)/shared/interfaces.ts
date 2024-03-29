import { IOptions } from "../_components/forms/UpdateQuestionForm";

export interface IQuestionForm {
    title: string;
    correct: string;
    options: IOptions[];
    poin ?: number;
    type ?: string;
    explanation ?: string;
    image: string; // URL gambar yang diupload
    imageName: string; // Nama file gambars will hold the image file
}
export interface IQuestion {
    _id: string;
    quiz: string; // unpopulated
    title: string;
    options: IOption[];
    image ?: string;
}

export interface IOption {
    value: string;
    _id?: string;
    poin?: number;
}

export interface IOptionWithFrequency extends IOption {
    frequency: number
}

export interface IResponse extends IQuestion {
    response: string;
}

export interface IResponseWithCorrect extends IResponse {
    correct: string;
}

export interface IQuizForm {
    title: string;
    description: string;
    tags?: string[];
    status?: string;
    duration ?: number;
}

export interface IQuiz extends IQuizForm {
    status: string;
    _id?: string;
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
    id?: string;
    attemptsCount?: number;
    questionsCount?: number;
}

export interface IAttempt {
    _id: string;
    userId: string;
    score: number;
    quiz: IQuiz
}

export interface IStatsByQuiz {
    attempt: {
        createdAt: Date,
        id: string,
        _id: string,
        score: number;
        quiz: {
            description: string;
            createdAt: string;
            author: string;
            id: string;
            status: string;
            tags: string[];
            title: string;
            updatedAt: Date;
        }
    };
    maxAttempts: {
        userId: string;
        val: number;
    };
    user: {
        email: string;
        firstName: string;
        lastName: string;
        photo: string;
        userId: string
    }
}
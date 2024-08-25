import {atom} from "jotai";
import type {User} from "@/api/api_types";

export const userAtom = atom<User|null>(null);
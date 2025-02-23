"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertValidator = void 0;
const zod_1 = require("zod");
exports.convertValidator = zod_1.z.object({
    from: zod_1.z.string().min(3).max(3).toUpperCase(),
    amount: zod_1.z.number().positive(),
    to: zod_1.z.array(zod_1.z.string().min(3).max(3)),
});

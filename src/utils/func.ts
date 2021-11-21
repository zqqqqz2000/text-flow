export const stepPartialFunc = (func: (args: any) => void, funcArgsSign: string[]) => {
    let accArgs: Record<string, unknown> = {};
    const argsNameSet = new Set(funcArgsSign);
    const resFunc = (args: Record<string, unknown>) => {
        for (let key in args) {
            argsNameSet.delete(key);
        }
        accArgs = { ...accArgs, ...args };
        if (argsNameSet.size === 0) {
            func(accArgs);
            accArgs = {};
        }
    };
    return { func: resFunc, reset: () => { accArgs = {}; } };
};
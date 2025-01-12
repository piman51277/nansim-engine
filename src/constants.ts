//this is arbitrary, but it should be enough for most cases
export const MAX_WIREVALUE_WIDTH = 32;

//this is arbitrary, but if a process ever hits this limit we have bigger problems

//number of times a network's value can be written to before it triggers an InfiniteLoopError
export const MAX_NETWORK_UPDATE_COUNT = 1000;
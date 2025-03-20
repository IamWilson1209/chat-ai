const ChatPlaceHolder = () => {
  return (
    <div className="w-3/4 bg-gray-secondary flex flex-col items-center justify-center py-10">
      <div className="flex flex-col items-center w-full justify-center py-96 gap-4">
        <p className="text-3xl font-extralight mt-5 mb-2 break-words mx-40">
          This experimental project will be integrated into{' '}
          <a
            href="https://shuan.ltd"
            className="font-bold text-black dark:text-white hover:text-blue-800"
          >
            Ex*
          </a>{' '}
          in the future.
        </p>
        <p className="w-1/2 text-center text-gray-primary text-sm text-muted-foreground">
          This app is designed for any team with LLM agents need, the open ai
          agents can be replaced by any self-training agents.
        </p>
      </div>
      <p className="w-1/2 mt-auto text-center text-gray-primary text-xs text-muted-foreground flex items-center justify-center gap-1"></p>
    </div>
  );
};
export default ChatPlaceHolder;

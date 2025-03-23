import { getRelativeDateTime, isSameDay } from '@/libs/utils';
import { IMessage } from '@/app/redux/conversation/IMessage';

type DateIndicatorProps = {
  message: IMessage;
  previousMessage?: IMessage;
};
const DateIndicator = ({ message, previousMessage }: DateIndicatorProps) => {
  return (
    <>
      {/* 無前一個message或同一天: null；有前一個message且不同天: 取得新一天的時間 */}
      {!previousMessage ||
      !isSameDay(previousMessage._creationTime, message._creationTime) ? (
        <div className="flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 p-1 z-50 rounded-md dark:bg-gray-primary">
            {getRelativeDateTime(message, previousMessage)}
          </p>
        </div>
      ) : null}
    </>
  );
};
export default DateIndicator;

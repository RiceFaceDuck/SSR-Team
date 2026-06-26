import React from 'react';

export default function AdjustBallsModal({
  isModalOpen,
  selectedUser,
  closeModal,
  handleSubmit,
  amount,
  setAmount,
  reason,
  setReason,
  isSubmitting,
}) {
  if (!isModalOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50 transition-opacity">
      <div className="relative w-full max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-2xl outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
            <h3 className="text-xl font-bold text-gray-800">ปรับยอด Balls ⚽</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closeModal}
            >
              <span className="text-2xl block outline-none focus:outline-none">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative p-6 flex-auto">
              <p className="mb-4 text-gray-600 text-sm">
                กำลังปรับยอดให้ผู้เล่น:{' '}
                <strong className="text-gray-900">
                  {selectedUser.displayName || selectedUser.username || selectedUser.id}
                </strong>
                <br />
                ยอดปัจจุบัน:{' '}
                <strong className="text-green-600">
                  {selectedUser.balls?.toLocaleString() || 0}
                </strong>{' '}
                ⚽
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                  จำนวน (+ เพื่อเพิ่ม, - เพื่อลด)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="amount"
                  type="number"
                  placeholder="เช่น 1000 หรือ -500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
                  เหตุผล (ระบุในระบบประวัติ)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="reason"
                  type="text"
                  placeholder="เช่น ชดเชยระบบล่ม, รางวัลกิฟต์อเวย์"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end p-5 border-t border-solid border-gray-200 rounded-b">
              <button
                className="text-gray-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:text-gray-800"
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                className={`${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150`}
                type="submit"
                disabled={isSubmitting || !amount || Number(amount) === 0}
              >
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปรับยอด'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

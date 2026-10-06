export default function Header({
  title,
  icon,
  buttonOnClick,
  buttonText,
  buttonIcon,
  buttonBgColor = "bg-[#263754] hover:bg-[#3d547a]",
}) {
  return (
    <div className="flex justify-between items-center mb-8 border-b pb-4">
      <h1 className="text-3xl font-bold flex items-center gap-3 text-[#263754]">
        {icon}
        {title}
      </h1>
      {buttonText && (
        <button
          onClick={buttonOnClick}
          className={`${buttonBgColor} text-white px-5 py-2.5 rounded text-sm font-bold flex items-center gap-2 shadow-sm transition-colors`}
        >
          {buttonIcon}
          {buttonText}
        </button>
      )}
    </div>
  );
}

import Stat from "../../MyActivity/Components/Stat";

function ChapterStats({
    items = [
        { name: "Total Members", value: 234 },
        { name: "Total Businesses", value: "223cr" },
        { name: "Total referrals", value: 780 },
    ],
}) {
    const StatItems = items.map((element, index) => (
        <Stat
            name={element.name}
            value={element.value}
            key={index}
            classname="min-w-[29%] m-1 whitespace-nowrap"
        />
    ));

    return (
        <div className="h-fit w-full rounded-2xl mx-auto p-4">
            <div className="flex flex-wrap items-center justify-center">
                {StatItems}
            </div>
        </div>
    );
}

export default ChapterStats;

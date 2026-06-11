import FramePlayer from "../components/FramePlayer";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <FramePlayer
        width={window.innerWidth}
        height={window.innerHeight}
        label=""
        loop={false}
        showHomeOnEnd={true}
      />
    </div>
  );
}

import { motion } from 'framer-motion';
import { Sparkles, Wrench, Users } from 'lucide-react';

const slides = [
  { icon: Wrench, text: 'Your work. Their skill.' },
  { icon: Users, text: '500+ workers, ready to roll.' },
  { icon: Sparkles, text: 'No bosses. No middlemen.' },
];

export function AuthSidePanel({ flavor = 'login' }) {
  return (
    <aside className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#5a1a04] text-white p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-5xl xl:text-6xl font-black leading-[1.05] mb-4 text-white">
          {flavor === 'login' ? (
            <>Welcome <span className="italic font-semibold">back.</span></>
          ) : (
            <>Join the <span className="italic font-semibold">crew.</span></>
          )}
        </h2>
        <p className="text-white/80 text-lg max-w-md">
          {flavor === 'login'
            ? "Time to clock in. Your pani is waiting."
            : "Whether you've got pani or you do pani — we got you."}
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
        className="flex flex-col gap-3"
      >
        {slides.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: -16 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
            }}
            className="flex items-center gap-3 text-white/90"
          >
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Icon size={16} />
            </span>
            <span className="font-medium">{text}</span>
          </motion.div>
        ))}
      </motion.div>

      <p className="text-white/60 text-sm m-0">Made with love in Kerala 🌴</p>

      {/* decorative blobs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#FF7B40]/30 blur-3xl pointer-events-none" />
    </aside>
  );
}

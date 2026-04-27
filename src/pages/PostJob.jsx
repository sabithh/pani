import { PageTransition } from '../components/layout/PageTransition';
import { PostJobWizard } from '../components/jobs/PostJobWizard';

export default function PostJob() {
  return (
    <PageTransition>
      <PostJobWizard />
    </PageTransition>
  );
}

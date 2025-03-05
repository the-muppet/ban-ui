import SearchPage from '@/app/components/features/Search';

export async function GET() {
    return <SearchPage title={'Search'} nav={[]} />;
}

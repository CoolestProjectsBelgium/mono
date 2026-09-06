export class VotesCalculationDto {
  projectId!: number;
  categoryId!: number;
  categoryName!: string;

  category_min!: number;
  category_max!: number;
  category_optional!: boolean;

  // Jury participation
  total_jurors!: number;
  vote_count!: number;
  votes_skipped!: number;
  participation_percent!: number;

  average_percent!: number;
  median_percent!: number;
  adjusted_average_percent!: number;

  score_stddev!: number;
  min_percent!: number;
  max_percent!: number;

  has_outliers!: boolean;
  outlier_count!: number;

  outlier_min_percent!: number;
  outlier_max_percent!: number;
}